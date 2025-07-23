"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { motion, backOut, anticipate } from "framer-motion";

const fiturCardVariants = {
  hidden: { opacity: 0, y: 60, scale: 0.9 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.7, ease: backOut } },
};
const fiturGridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.25 } },
};

const LandingPage = () => {
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [previewAlt, setPreviewAlt] = useState<string>("");

  // Refs for scrollspy
  const fiturRef = useRef<HTMLElement>(null);
  const tentangRef = useRef<HTMLElement>(null);
  const timRef = useRef<HTMLElement>(null);

  // Scrollspy effect
  useEffect(() => {
    const sections = [
      { ref: fiturRef, hash: "#fitur-unggulan" },
      { ref: tentangRef, hash: "#tentang-kami" },
      { ref: timRef, hash: "#tim-pengembang" },
    ];
    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      // Cari entry yang paling banyak terlihat (isIntersecting dan rasio terbesar)
      const visible = entries.filter(e => e.isIntersecting);
      if (visible.length > 0) {
        // Urutkan berdasarkan rasio terbesar
        visible.sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const id = visible[0].target.getAttribute("id");
        if (id) {
          const hash = `#${id}`;
          if (window.location.hash !== hash) {
            window.history.replaceState(null, "", hash);
          }
        }
      } else {
        // Jika tidak ada section utama yang aktif, hapus hash
        if (window.location.hash) {
          window.history.replaceState(null, "", window.location.pathname);
        }
      }
    };
    const observer = new window.IntersectionObserver(handleIntersect, {
      threshold: [0.3, 0.6, 0.9],
    });
    sections.forEach(({ ref }) => {
      if (ref.current) observer.observe(ref.current);
    });
    return () => observer.disconnect();
  }, []);

  const openPreview = (src: string, alt: string) => {
    setPreviewSrc(src);
    setPreviewAlt(alt);
  };
  const closePreview = () => setPreviewSrc(null);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-center p-4 sm:p-6 gap-2 sm:gap-0">
        <div className="text-xl sm:text-2xl font-bold text-gray-800">EcoWatcher</div>
        <nav className="flex items-center space-x-4 sm:space-x-6 mt-2 sm:mt-0">
          <a href="#fitur-unggulan" className="text-gray-600 hover:text-gray-800 text-base sm:text-lg scroll-smooth">
            Fitur
          </a>
          <a href="#tentang-kami" className="text-gray-600 hover:text-gray-800 text-base sm:text-lg scroll-smooth">
            Tentang Kami
          </a>
          <a href="#tim-pengembang" className="text-gray-600 hover:text-gray-800 text-base sm:text-lg scroll-smooth">
            Tim Pengembang
          </a>
        </nav>
      </header>

      {/* Hero Section */}
      <motion.main
        initial={{ opacity: 0, scale: 0.95, rotate: -2, y: 60 }}
        whileInView={{ opacity: 1, scale: 1, rotate: 0, y: 0 }}
        transition={{ duration: 0.9, ease: backOut }}
        viewport={{ once: true, amount: 0.2 }}
        className="flex-grow flex items-center justify-center bg-gradient-to-br from-green-100 via-white to-blue-100"
      >
        <div className="container mx-auto px-4 sm:px-6 py-10 md:py-16">
          <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-10">
            <div className="w-full md:w-1/2 mt-8 md:mt-0">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 leading-tight drop-shadow-lg text-center md:text-left">
                Bersama Wujudkan <br className="hidden sm:block" /> Lingkungan Bebas Sampah
              </h1>
              <p className="mt-4 text-gray-600 text-base sm:text-lg text-center md:text-left">
                Bangun Perubahan Mulai Dari Komunitas! Dengan Sistem Pemantauan
                Sampah Berbasis Komunitas, Anda Bisa Berperan Langsung Dalam
                Menjaga Kebersihan Lingkungan, Melaporkan Titik Sampah, dan
                Mendorong Aksi Nyata Bersama Warga Lainnya.
              </p>
              <div className="mt-8 flex justify-center md:justify-start">
              <a
                href="https://apkpure.com/ecowatcher/com.anonymous.ecowatcher"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-700 shadow-lg transition text-lg w-full max-w-xs text-center"
              >
                Unduh di APKPure
              </a>
              </div>
            </div>
            <div className="w-full md:w-1/2 flex justify-center">
              <Image
                src="/assets/img/aplikasi.png"
                alt="EcoWatcher Hero"
                className="max-w-full h-auto rounded-2xl shadow-2xl border-4 border-green-200"
                width={400}
                height={400}
                priority
              />
            </div>
          </div>
        </div>
      </motion.main>

      {/* Section Fitur Unggulan */}
      <motion.section
        id="fitur-unggulan"
        ref={fiturRef}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={fiturGridVariants}
        className="py-10 sm:py-16 md:py-20 bg-gray-50"
      >
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-8 sm:mb-10">Fitur Unggulan</h2>
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8"
            variants={fiturGridVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            {/* Fitur 1 */}
            <motion.div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center hover:scale-105 transition-transform group" variants={fiturCardVariants}>
              <Image src="/assets/img/campaign.jpg" alt="Kampanye" width={300} height={200} className="rounded-lg shadow mb-4 group-hover:ring-4 group-hover:ring-green-200 transition max-w-full h-auto" />
              <h3 className="font-bold text-base sm:text-lg mb-2 text-green-700 text-center">Kampanye</h3>
              <p className="text-gray-600 text-center text-sm sm:text-base">Penyumbang dapat melihat informasi seputar kegiatan yang bertujuan mengajak masyarakat ikut serta dalam campaign yang diadakan komunitas.</p>
            </motion.div>
            {/* Fitur 2 */}
            <motion.div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center hover:scale-105 transition-transform group" variants={fiturCardVariants}>
              <Image src="/assets/img/penyetoran.jpg" alt="Form Penyetoran Sampah" width={300} height={200} className="rounded-lg shadow mb-4 group-hover:ring-4 group-hover:ring-green-200 transition max-w-full h-auto" />
              <h3 className="font-bold text-base sm:text-lg mb-2 text-green-700 text-center">Form Penyetoran Sampah</h3>
              <p className="text-gray-600 text-center text-sm sm:text-base">Pengelola dapat menerima formulir yang diajukan oleh pengguna tentang adanya sampah daur ulang yang perlu penanganan.</p>
            </motion.div>
            {/* Fitur 3 */}
            <motion.div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center hover:scale-105 transition-transform group" variants={fiturCardVariants}>
              <Image src="/assets/img/tukarpoint.jpg" alt="Tukar Poin Sampah" width={300} height={200} className="rounded-lg shadow mb-4 group-hover:ring-4 group-hover:ring-green-200 transition max-w-full h-auto" />
              <h3 className="font-bold text-base sm:text-lg mb-2 text-green-700 text-center">Tukar Poin Sampah</h3>
              <p className="text-gray-600 text-center text-sm sm:text-base">Penyumbang dapat menukar poin penyetoran sampah dengan uang tunai.</p>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* About Us Section */}
      <motion.section
        id="tentang-kami"
        ref={tentangRef}
        initial={{ opacity: 0, y: 80 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: anticipate }}
        viewport={{ once: true, amount: 0.2 }}
        className="bg-white py-10 sm:py-16 md:py-20"
      >
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center">
            <h2 className="text-xs sm:text-sm font-bold text-green-600 uppercase">Tentang Kami</h2>
            <h3 className="mt-2 text-2xl sm:text-4xl font-bold text-gray-800">Inovasi Digital Untuk Lingkungan Yang Lebih Bersih</h3>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
              Kami adalah tim pengembang yang berkomitmen menghadirkan solusi digital untuk mendukung pengelolaan sampah yang lebih efisien dan partisipatif. Aplikasi pemantauan sampah berbasis komunitas yang kami kembangkan kini hadir dengan fitur baru, yaitu Campaign, yang memungkinkan pengguna ikut serta dalam berbagai aksi lingkungan secara langsung.
            </p>
            <div className="mt-6">
              {/* <a href="#" className="text-green-600 hover:text-green-700 font-semibold text-sm sm:text-base">Read more &rarr;</a> */}
            </div>
          </div>
        </div>
      </motion.section>

      {/* Anggota Kelompok Section */}
      <motion.section
        id="tim-pengembang"
        ref={timRef}
        initial={{ opacity: 0, y: 80 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: anticipate }}
        viewport={{ once: true, amount: 0.2 }}
        className="bg-gray-50 py-10 sm:py-16 md:py-20"
      >
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-8 sm:mb-12">Tim Pengembang</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 justify-items-center">
            {/* Anggota 1 */}
            <div className="flex flex-col justify-between items-center bg-white rounded-xl shadow-lg p-6 w-full max-w-xs min-h-[320px] h-full">
              <button type="button" onClick={() => openPreview("/assets/img/bagas1.jpg", "Bagas Satria Bimantara")}
                className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center mb-4 overflow-hidden focus:outline-none focus:ring-2 focus:ring-green-400">
                <Image src="/assets/img/bagas1.jpg" alt="Bagas Satria Bimantara" width={128} height={128} className="object-cover w-32 h-32 rounded-full" />
              </button>
              <div className="font-bold text-lg text-gray-800 mb-1 min-h-[48px] flex items-center justify-center text-center">
                Bagas Satria Bimantara
              </div>
              <div className="text-gray-500 text-sm mt-auto">Analisis</div>
            </div>
            {/* Anggota 2 */}
            <div className="flex flex-col justify-between items-center bg-white rounded-xl shadow-lg p-6 w-full max-w-xs min-h-[320px] h-full">
              <button type="button" onClick={() => openPreview("/assets/img/farhan.jpg", "Muhammad Farhan syafrullah")}
                className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center mb-4 overflow-hidden focus:outline-none focus:ring-2 focus:ring-green-400">
                <Image src="/assets/img/farhan.jpg" alt="Muhammad Farhan syafrullah" width={128} height={128} className="object-cover w-32 h-32 rounded-full" />
              </button>
              <div className="font-bold text-lg text-gray-800 mb-1 min-h-[48px] flex items-center justify-center text-center">
                Muhammad Farhan syafrullah
              </div>
              <div className="text-gray-500 text-sm mt-auto">Front-End Developer</div>
            </div>
            {/* Anggota 3 */}
            <div className="flex flex-col justify-between items-center bg-white rounded-xl shadow-lg p-6 w-full max-w-xs min-h-[320px] h-full">
              <button type="button" onClick={() => openPreview("/assets/img/ruki.jpg", "M. Taufiqurrahman Ruki Hasibuan")}
                className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center mb-4 overflow-hidden focus:outline-none focus:ring-2 focus:ring-green-400">
                <Image src="/assets/img/ruki.jpg" alt="M. Taufiqurrahman Ruki Hasibuan" width={128} height={128} className="object-cover w-32 h-32 rounded-full" />
              </button>
              <div className="font-bold text-lg text-gray-800 mb-1 min-h-[48px] flex items-center justify-center text-center">
                M. Taufiqurrahman Ruki Hasibuan
              </div>
              <div className="text-gray-500 text-sm mt-auto">Design</div>
            </div>
            {/* Anggota 4 */}
            <div className="flex flex-col justify-between items-center bg-white rounded-xl shadow-lg p-6 w-full max-w-xs min-h-[320px] h-full">
              <button type="button" onClick={() => openPreview("/assets/img/fitrah.jpg", "Fitrah Yohana")}
                className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center mb-4 overflow-hidden focus:outline-none focus:ring-2 focus:ring-green-400">
                <Image src="/assets/img/fitrah.jpg" alt="Fitrah Yohana" width={128} height={128} className="object-cover w-32 h-32 rounded-full" />
              </button>
              <div className="font-bold text-lg text-gray-800 mb-1 min-h-[48px] flex items-center justify-center text-center">
                Fitrah Yohana
              </div>
              <div className="text-gray-500 text-sm mt-auto">Analisis</div>
            </div>
            {/* Anggota 5 */}
            <div className="flex flex-col justify-between items-center bg-white rounded-xl shadow-lg p-6 w-full max-w-xs min-h-[320px] h-full">
              <button type="button" onClick={() => openPreview("/assets/img/rois.jpg", "Muhammad Rois Mauludi")}
                className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center mb-4 overflow-hidden focus:outline-none focus:ring-2 focus:ring-green-400">
                <Image src="/assets/img/rois.jpg" alt="Muhammad Rois Mauludi" width={128} height={128} className="object-cover w-32 h-32 rounded-full" />
              </button>
              <div className="font-bold text-lg text-gray-800 mb-1 min-h-[48px] flex items-center justify-center text-center">
                Muhammad Rois Mauludi
              </div>
              <div className="text-gray-500 text-sm mt-auto">Full-Stack Developer</div>
            </div>
          </div>
        </div>
        {/* Modal Preview Foto */}
        {previewSrc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm" onClick={closePreview}>
            <div className="relative max-w-xs sm:max-w-md md:max-w-lg w-full p-4" onClick={e => e.stopPropagation()}>
              <button onClick={closePreview} className="absolute top-2 right-2 text-black bg-white bg-opacity-40 rounded-full p-1 hover:bg-opacity-70 focus:outline-none">
                <span className="text-2xl">&times;</span>
              </button>
              <Image src={previewSrc} alt={previewAlt} width={400} height={400} className="rounded-xl w-full h-auto object-contain bg-white" />
              <div className="mt-2 text-center text-black text-base font-semibold drop-shadow-lg">{previewAlt}</div>
            </div>
          </div>
        )}
      </motion.section>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0, y: 80 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: anticipate }}
        viewport={{ once: true, amount: 0.2 }}
        className="bg-white py-6 sm:py-10 mt-auto"
      >
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0">
            <div className="text-xl font-bold text-gray-800 mb-2 md:mb-0 text-center md:text-left">EcoWatcher</div>
            <div className="flex flex-col sm:flex-row sm:space-x-12 w-full sm:w-auto items-center sm:items-start text-center sm:text-left">
              <div className="mb-2 sm:mb-0">
                <h5 className="font-bold text-gray-800">Tentang</h5>
                <ul className="mt-1 space-y-1">
                  <li>
                    <a href="#" className="text-gray-600 hover:text-gray-800">Karir</a>
                  </li>
                </ul>
              </div>
              <div>
                <h5 className="font-bold text-gray-800">Kontak & Bantuan</h5>
                <ul className="mt-1 space-y-1">
                  <li>
                    <a href="mailto:ecowatcher615@gmail.com" className="text-gray-600 hover:text-green-700 underline break-all">
                      <span className="mr-1" role="img" aria-label="email">✉️</span>ecowatcher615@gmail.com
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-4 border-t border-gray-200 pt-4 text-center text-gray-600 text-xs sm:text-sm">
            &copy; 2025 ECOWATCHER - All rights reserved.
          </div>
        </div>
      </motion.footer>
    </div>
  );
};

export default LandingPage;
