const sizeStyles = {
    sm: { wrapper: "", box: "w-8 h-8 rounded-lg", icon: "w-4 h-4" },
    md: { wrapper: "", box: "w-14 h-14 rounded-xl", icon: "w-9 h-9" },
    lg: { wrapper: "text-center mb-8", box: "w-16 h-16 rounded-2xl mb-4", icon: "w-8 h-8" },
};

export default function LogoBrand({ size = "sm" }: { size?: "sm" | "md" | "lg" }) {
    const s = sizeStyles[size];
    return (
        <div className={s.wrapper}>
            <div className={`inline-flex items-center justify-center bg-blue-600 ${s.box}`}>
                <svg className={`${s.icon} text-white`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            </div>
        </div>
    );
}