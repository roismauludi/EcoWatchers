import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, TouchableOpacity, ScrollView, Modal, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CONFIG from '../config';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import moment from 'moment';
import analytics from '@react-native-firebase/analytics';

type Item = {
    description: string;
    image: string;
    itemId: string;
    name: string;
    points: number;
    quantity: number;
    timestamp: string;
    type: string;
    userId: string;
};

type Penyetoran = {
    id: string;
    queueNumber: string;
    status: string;
    items: Item[];
    createdAt: string;
    pickUpFee: number;
};

type Transaction = {
    id: string;
    namaRekening: string;
    jenisBank: string;
    nominal: number;
    pointUsed: number;
    timestamp: string;
    status: string;
};

type DataState = {
    penyetoran: Penyetoran[];
    transactions: Transaction[];
};

const isPenyetoran = (item: Penyetoran | Transaction): item is Penyetoran => {
    return (item as Penyetoran).createdAt !== undefined;
};

const formatNumber = (number: number) => {
    return new Intl.NumberFormat('id-ID').format(number);
};

const FILTER_OPTIONS = [
    { label: 'Semua', value: 'all' },
    { label: 'Hari Ini', value: 'today' },
    { label: 'Kemarin', value: 'yesterday' },
    { label: 'Minggu Ini', value: 'thisweek' },
    { label: 'Bulan Ini', value: 'thismonth' },
    { label: 'Pilih Bulan...', value: 'custommonth' }, // Tambahan
];

const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const RiwayatScreen: React.FC = () => {
    const [userId, setUserId] = useState<string | null>(null);
    const [data, setData] = useState<DataState | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState<'all' | 'today' | 'yesterday' | 'thisweek' | 'thismonth' | 'custommonth'>('all');
    const [customMonth, setCustomMonth] = useState<number | null>(null); // 0-11
    const [customYear, setCustomYear] = useState<number | null>(null);
    const [showMonthPicker, setShowMonthPicker] = useState(false);

    const fetchData = async () => {
        console.log('Fetching data...');
        if (userId) {
            try {
                const response = await fetch(`${CONFIG.API_URL}/getUserData/${userId}`);
                console.log('API Response Status:', response.status);
                const result = await response.json();
                console.log('API Response Data:', result);

                if (response.ok) {
                    setData(result);
                } else {
                    setError(result.message || 'Failed to fetch data');
                }
            } catch (error) {
                setError('An error occurred while fetching transactions');
            }
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    };

    useEffect(() => {
        const getUserIdFromStorage = async () => {
            try {
                const storedUserId = await AsyncStorage.getItem('userId');
                if (storedUserId) {
                    setUserId(storedUserId);
                } else {
                    console.log('No user ID found in AsyncStorage');
                }
            } catch (e) {
                console.error('Error reading userId from AsyncStorage', e);
            }
        };

        getUserIdFromStorage();
    }, []);

    useEffect(() => {
        if (userId) fetchData();
    }, [userId]);

    // Tambahkan auto refresh saat screen difokuskan
    useFocusEffect(
        React.useCallback(() => {
            fetchData();
        }, [userId])
    );

    useEffect(() => {
        analytics().logEvent('screen_view', { screen_name: 'Riwayat' });
    }, []);

    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        };
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', options);
    };

    const combinedData = [...(data?.penyetoran || []), ...(data?.transactions || [])];

    combinedData.sort((a, b) => {
        let dateA: Date;
        let dateB: Date;

        if (isPenyetoran(a)) {
            dateA = new Date(a.createdAt);
        } else {
            dateA = new Date(a.timestamp);
        }

        if (isPenyetoran(b)) {
            dateB = new Date(b.createdAt);
        } else {
            dateB = new Date(b.timestamp);
        }

        return dateB.getTime() - dateA.getTime();
    });

    // Filter data sesuai pilihan
    const now = moment();
    const filteredData = combinedData.filter((item) => {
        let date: moment.Moment;
        if (isPenyetoran(item)) {
            date = moment(item.createdAt);
        } else {
            date = moment(item.timestamp);
        }
        if (filter === 'today') {
            return date.isSame(now, 'day');
        } else if (filter === 'yesterday') {
            return date.isSame(now.clone().subtract(1, 'day'), 'day');
        } else if (filter === 'thisweek') {
            return date.isSame(now, 'week');
        } else if (filter === 'thismonth') {
            return date.isSame(now, 'month');
        } else if (filter === 'custommonth' && customMonth !== null && customYear !== null) {
            return date.month() === customMonth && date.year() === customYear;
        }
        return true;
    });

    filteredData.sort((a, b) => {
        let dateA: Date;
        let dateB: Date;
        if (isPenyetoran(a)) {
            dateA = new Date(a.createdAt);
        } else {
            dateA = new Date(a.timestamp);
        }
        if (isPenyetoran(b)) {
            dateB = new Date(b.createdAt);
        } else {
            dateB = new Date(b.timestamp);
        }
        return dateB.getTime() - dateA.getTime();
    });

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    if (!data || (data.penyetoran.length === 0 && data.transactions.length === 0)) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Tidak ada data yang tersedia</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Riwayat</Text>
            {/* Filter */}
            <View style={styles.filterScrollWrapper}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.filterContainer}>
                        {FILTER_OPTIONS.map(opt => (
                            <TouchableOpacity
                                key={opt.value}
                                style={[
                                    styles.filterButton,
                                    filter === opt.value && styles.filterButtonActive
                                ]}
                                onPress={() => {
                                    if (opt.value === 'custommonth') {
                                        setShowMonthPicker(true);
                                    } else {
                                        setFilter(opt.value as any);
                                    }
                                }}
                            >
                                <Text style={[
                                    styles.filterButtonText,
                                    filter === opt.value && styles.filterButtonTextActive
                                ]}>
                                    {opt.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
            </View>

            {/* Modal Picker Bulan & Tahun */}
            <Modal
                visible={showMonthPicker}
                transparent
                animationType="fade"
                onRequestClose={() => setShowMonthPicker(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.monthPickerModal}>
                        <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 10 }}>Pilih Bulan & Tahun</Text>
                        <View style={{ flexDirection: 'row', marginBottom: 16 }}>
                            {/* Picker Bulan */}
                            <ScrollView style={{ maxHeight: 150 }}>
                                {monthNames.map((m, idx) => (
                                    <Pressable
                                        key={m}
                                        style={{ padding: 8, backgroundColor: customMonth === idx ? '#4CAF50' : 'transparent', borderRadius: 8 }}
                                        onPress={() => setCustomMonth(idx)}
                                    >
                                        <Text style={{ color: customMonth === idx ? '#fff' : '#333' }}>{m}</Text>
                                    </Pressable>
                                ))}
                            </ScrollView>
                            {/* Picker Tahun */}
                            <ScrollView style={{ maxHeight: 150, marginLeft: 16 }}>
                                {Array.from({ length: 6 }).map((_, i) => {
                                    const year = now.year() - i;
                                    return (
                                        <Pressable
                                            key={year}
                                            style={{ padding: 8, backgroundColor: customYear === year ? '#4CAF50' : 'transparent', borderRadius: 8 }}
                                            onPress={() => setCustomYear(year)}
                                        >
                                            <Text style={{ color: customYear === year ? '#fff' : '#333' }}>{year}</Text>
                                        </Pressable>
                                    );
                                })}
                            </ScrollView>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                            <TouchableOpacity
                                style={{ marginRight: 16 }}
                                onPress={() => setShowMonthPicker(false)}
                            >
                                <Text style={{ color: '#888' }}>Batal</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{ backgroundColor: '#4CAF50', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8 }}
                                onPress={() => {
                                    if (customMonth !== null && customYear !== null) {
                                        setFilter('custommonth');
                                        setShowMonthPicker(false);
                                    }
                                }}
                            >
                                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Terapkan</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <FlatList
                data={filteredData}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                    if ('items' in item) {
                        if (item.status === 'Dibatalkan') {
                            return (
                                <View style={styles.transactionItem}>
                                    <View style={styles.row}>
                                        <View style={styles.iconBox}>
                                            <FontAwesome5 name="truck" size={30} color="#FF0000" />
                                        </View>
                                        <View style={styles.textContainer}>
                                            <View style={styles.smallIconContainer}>
                                                <Ionicons name="close" size={16} color="#FF0000" />
                                                <Text style={styles.smallText}>Dibatalkan</Text>
                                            </View>
                                            <Text style={styles.title}>Pick Up</Text>
                                            <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
                                        </View>
                                        <View style={styles.statusContainer}>
                                            <Text style={styles.statusText}>{item.status}</Text>
                                        </View>
                                    </View>
                                </View>
                            );
                        } else {
                            const totalPoints = item.items.reduce(
                                (sum, currentItem) => sum + currentItem.points * currentItem.quantity,
                                0
                            ) - item.pickUpFee;

                            return (
                                <View style={styles.transactionItem}>
                                    <View style={styles.row}>
                                        <View style={styles.iconBox}>
                                            <FontAwesome5 name="truck" size={30} color="#4CAF50" />
                                        </View>
                                        <View style={styles.textContainer}>
                                            <View style={styles.smallIconContainer}>
                                                <Ionicons name="arrow-down" size={16} color="#4CAF50" />
                                                <Text style={styles.smallText}>Masuk</Text>
                                            </View>
                                            <Text style={styles.title}>Pick Up</Text>
                                            <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
                                        </View>
                                        <View style={styles.totalPointsContainer}>
                                            <Ionicons name="add" size={14} color="#333" style={styles.icon} />
                                            <Text>{formatNumber(totalPoints > 0 ? totalPoints : 0)} Point</Text>
                                        </View>
                                    </View>
                                </View>
                            );
                        }
                    } else {
                        return (
                            <View style={styles.transactionItem}>
                                <View style={styles.row}>
                                    <View style={styles.iconBox}>
                                        <FontAwesome5 name="sync-alt" size={30} color="#FF5722" />
                                    </View>
                                    <View style={styles.textContainer}>
                                        <View style={styles.smallIconContainer}>
                                            <Ionicons name="arrow-up" size={16} color="#FF5722" />
                                            <Text style={styles.smallText}>Keluar</Text>
                                        </View>
                                        <Text style={styles.title}>Tukar Point</Text>
                                        <Text style={styles.dateText}>{formatDate(item.timestamp)}</Text>
                                    </View>
                                    <View style={styles.tukarPointsContainer}>
                                        <View style={[
                                            styles.statusBadgeInline,
                                            item.status === 'Diajukan' ? styles.statusPending :
                                            item.status === 'Selesai' ? styles.statusSuccess :
                                            styles.statusDefault
                                        ]}>
                                            <Text style={[
                                                styles.statusBadgeText,
                                                item.status === 'Selesai' ? { color: '#388E3C' } : { color: '#F57C00' }
                                            ]}>{item.status || 'Diajukan'}</Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                                            <FontAwesome5 name="minus" size={14} color="#333" style={styles.icon} />
                                            <Text>{formatNumber(item.pointUsed)} Point</Text>
                                        </View>
                                    </View>
                                </View>
                                {item.status === 'Selesai' && (
                                    <View style={styles.transferInfo}>
                                        <Text style={styles.transferText}>
                                            Transfer ke: {item.namaRekening} ({item.jenisBank})
                                        </Text>
                                        <Text style={styles.nominalText}>
                                            Rp {formatNumber(item.nominal)}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        );
                    }
                }}
                contentContainerStyle={{ paddingBottom: 100 }}
                ListFooterComponent={<View style={{ height: 20 }} />}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
        alignSelf: 'center',
    },
    transactionItem: {
        backgroundColor: '#f9f9f9',
        padding: 10,
        marginBottom: 8,
        borderRadius: 8,
        position: 'relative',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    iconBox: {
        backgroundColor: '#e0e0e0',
        borderRadius: 8,
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    icon: {
        marginRight: 10,
        fontSize: 14,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    smallIconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    smallText: {
        fontSize: 12,
        color: '#333',
        marginLeft: 5,
    },
    totalPointsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    tukarPointsContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 110,
    },
    statusContainer: {
        backgroundColor: '#ffeeba',
        borderRadius: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        alignSelf: 'flex-start',
        marginTop: 5,
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#856404',
    },
    dateText: {
        fontSize: 14,
        color: '#666',
        marginTop: 5,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8d7da',
    },
    errorText: {
        color: '#721c24',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    emptyText: {
        fontSize: 16,
        color: '#333',
    },
    rightContainer: {
        alignItems: 'flex-end',
        flex: 1,
    },
    statusBadgeInline: {
        alignSelf: 'center',
        marginBottom: 2,
        paddingHorizontal: 16,
        paddingVertical: 5,
        borderRadius: 20,
        elevation: 2,
    },
    statusBadgeText: {
        fontSize: 15,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    statusPending: {
        backgroundColor: '#FFE0B2',
    },
    statusSuccess: {
        backgroundColor: '#C8E6C9',
    },
    statusDefault: {
        backgroundColor: '#F5F5F5',
    },
    transferInfo: {
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    transferText: {
        fontSize: 12,
        color: '#666',
    },
    nominalText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#00796b',
        marginTop: 2,
    },
    filterScrollWrapper: {
        marginBottom: 10,
    },
    filterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 5,
        paddingHorizontal: 2,
    },
    filterButton: {
        paddingHorizontal: 18,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#ccc',
        marginRight: 8,
        backgroundColor: '#fff',
    },
    filterButtonActive: {
        backgroundColor: '#4CAF50',
        borderColor: '#4CAF50',
        shadowColor: '#4CAF50',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 2,
    },
    filterButtonText: {
        fontSize: 14,
        color: '#333',
        fontWeight: 'bold',
    },
    filterButtonTextActive: {
        color: '#fff',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    monthPickerModal: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        width: 320,
        elevation: 5,
    },
});

export default RiwayatScreen;
