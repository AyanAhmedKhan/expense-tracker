import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Unauthorized = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
            <div className="max-w-md w-full text-center space-y-8">
                <div className="flex justify-center">
                    <div className="bg-red-100 p-4 rounded-full dark:bg-red-900/20">
                        <ShieldAlert className="w-16 h-16 text-red-600 dark:text-red-500" />
                    </div>
                </div>

                <div className="space-y-4">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
                        Access Denied
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        You don't have permission to access this page. Please contact your administrator if you believe this is a mistake.
                    </p>
                </div>

                <div className="pt-4">
                    <Button
                        onClick={() => navigate(-1)}
                        className="w-full sm:w-auto gap-2"
                        variant="default"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Go Back
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Unauthorized;
