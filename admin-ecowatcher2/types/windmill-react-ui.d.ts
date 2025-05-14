declare module "@roketid/windmill-react-ui" {
  import { FC, ReactNode, Context, ChangeEvent } from "react";

  export interface TableProps {
    children: ReactNode;
  }

  export interface ButtonProps {
    layout?: string;
    size?: string;
    block?: boolean;
    disabled?: boolean;
    className?: string;
    children?: ReactNode;
    onClick?: () => void;
  }

  export interface BadgeProps {
    type?: string;
    children: ReactNode;
  }

  export interface TableCellProps {
    children: ReactNode;
  }

  export interface PaginationProps {
    totalResults: number;
    resultsPerPage: number;
    onChange: (page: number) => void;
    label: string;
  }

  export interface TableContainerProps {
    children: ReactNode;
    className?: string;
  }

  export interface WindmillContextType {
    mode: "light" | "dark";
    toggleMode?: () => void;
  }

  export interface InputProps {
    className?: string;
    type?: string;
    value?: string;
    placeholder?: string;
    onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  }

  export const Table: FC<TableProps>;
  export const TableHeader: FC;
  export const TableBody: FC;
  export const TableFooter: FC;
  export const TableContainer: FC<TableContainerProps>;
  export const TableRow: FC;
  export const TableCell: FC<TableCellProps>;
  export const Button: FC<ButtonProps>;
  export const Badge: FC<BadgeProps>;
  export const Pagination: FC<PaginationProps>;
  export const Avatar: FC<{ src: string; alt: string; className?: string }>;
  export const Input: FC<InputProps>;
  export const Label: FC<any>;
  export const WindmillContext: Context<WindmillContextType>;
}
