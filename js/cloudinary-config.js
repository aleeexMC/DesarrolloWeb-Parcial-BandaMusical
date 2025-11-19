export const CLOUDINARY_CONFIG = {
    cloudName: 'dzdtlzomz',
    uploadPreset: 'twenty_one_pilots_members'
};

export async function subirImagenCloudinary(archivo) {
    const formData = new FormData();
    formData.append('file', archivo);
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
    formData.append('folder', 'members');

    try {
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`,
            {
                method: 'POST',
                body: formData
            }
        );

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        return data.secure_url;
    } catch (error) {
        console.error('Error Cloudinary:', error);
        throw new Error('No se pudo subir la imagen');
    }
}