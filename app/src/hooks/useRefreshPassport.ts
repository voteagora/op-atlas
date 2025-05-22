import { useUserPOH } from '@/hooks/db/useUserPOH';
import { refreshUserPassport } from '@/lib/actions/users';
import { toast } from 'sonner';

export const useRefreshPassport = (userId: string) => {

    const { invalidate } = useUserPOH({ enabled: false, id: userId });

    const refreshPassport = async () => {
        return toast.promise(
            refreshUserPassport().then(() => invalidate()),
            {
                loading: "Updating passport score...",
                success: "Passport score updated successfully",
                error: "Failed to update passport score",
            },
        );
    };

    return { refreshPassport };
}; 