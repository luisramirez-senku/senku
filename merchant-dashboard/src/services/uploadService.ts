export async function getPresignedUrl(
    fileName: string,
    fileType: string
  ): Promise<{ url: string; key: string }> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/uploads/presign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName, fileType }),
    });
  
    if (!response.ok) {
      throw new Error('Error al obtener el presigned URL');
    }
  
    return await response.json();
  }
  
  export async function uploadFile(file: File): Promise<string> {
    // Aquí es donde generamos el presigned URL
    const { url, key } = await getPresignedUrl(file.name, file.type);
  
    const uploadResponse = await fetch(url, {
      method: 'PUT',
      body: file,
    });
  
    if (!uploadResponse.ok) {
      throw new Error('Error al subir el archivo a S3');
    }
  
    // Retornamos la URL final del archivo (ajustado al CDN)
    const fileUrl = `${process.env.NEXT_PUBLIC_CDN_BASE_URL}/${key}`;
    return fileUrl;
  }
  