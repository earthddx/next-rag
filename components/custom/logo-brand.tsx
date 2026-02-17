export default function LogoBrand({ size = "lg" }: { size?: "sm" | "lg" }) {
    const isSmall = size === "sm";
    return (
        <div className={isSmall ? "" : "text-center mb-8"}>
            <div className={`inline-flex items-center justify-center bg-blue-600 ${isSmall ? "w-8 h-8 rounded-lg" : "w-16 h-16 rounded-2xl mb-4"}`}>
                <svg className={`${isSmall ? "w-4 h-4" : "w-8 h-8"} text-white`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            </div>
        </div>
    );
}