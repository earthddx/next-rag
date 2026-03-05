'use client';

import React from "react";
import Navigation from "./navigation";
import ProfileSection from "./profile-section";
import ExportData from "./export-data";
import DangerZone from "./danger-zone";
import DeleteAccount from "./delete-account";

export default function SettingsClient({
    userName,
    userEmail,
    userImageSrc,
    hasPassword,
}: {
    userName: string | null | undefined;
    userEmail: string | null | undefined;
    userImageSrc: string | null | undefined;
    hasPassword: boolean;
}) {
    const [deleteOpen, setDeleteOpen] = React.useState<boolean>(false);

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
            <Navigation />
            <main className="mx-auto max-w-2xl px-6 py-8 space-y-8">
                <h1 className="text-2xl font-semibold text-slate-100">Settings</h1>
                <ProfileSection userName={userName} userEmail={userEmail} userImageSrc={userImageSrc} hasPassword={hasPassword} />
                <ExportData />
                <DangerZone setDeleteOpen={setDeleteOpen} />
            </main>
            <DeleteAccount deleteOpen={deleteOpen} setDeleteOpen={setDeleteOpen} />
        </div>
    );
}