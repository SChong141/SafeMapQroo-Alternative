import { useState } from "react";
import { apiClient } from "../../generateapi";

export const useDeleteShelter = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const deleteShelter = async (id) => {
        setLoading(true);
        setError(null);
        try {
            await apiClient.delete(`/shelters/${id}`);
            return true;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };
    return { loading, error, deleteShelter };
};