import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api'; // Adjust the base URL as needed

export const fetchClipboardItems = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/clipboard-items`);
        return response.data;
    } catch (error) {
        console.error('Error fetching clipboard items:', error);
        throw error;
    }
};

export const addClipboardItem = async (item) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/clipboard-items`, item);
        return response.data;
    } catch (error) {
        console.error('Error adding clipboard item:', error);
        throw error;
    }
};

export const deleteClipboardItem = async (id) => {
    try {
        await axios.delete(`${API_BASE_URL}/clipboard-items/${id}`);
    } catch (error) {
        console.error('Error deleting clipboard item:', error);
        throw error;
    }
};