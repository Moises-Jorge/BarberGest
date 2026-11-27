// O URL nunca é montado a partir do cabeçalho Host, que é controlado pelo cliente
export const buildImageUrl = (filename: string): string => {
    const baseUrl = process.env.PUBLIC_URL || `http://localhost:${process.env.PORT || 4000}`;
    return `${baseUrl.replace(/\/+$/, "")}/files/${filename}`;
};
