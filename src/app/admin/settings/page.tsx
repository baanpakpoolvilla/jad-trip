import { AdminSiteSettingsForm } from "@/components/admin-site-settings-form";
import { getSiteSettings } from "@/lib/site-settings";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="space-y-8">
      <header className="jad-page-header">
        <p className="jad-section-label">แอดมิน</p>
        <h1 className="jad-page-title">ตั้งค่าเว็บไซต์</h1>
        <p className="text-sm text-fg-muted">
          ชื่อ คำอธิบาย โลโก้ และ favicon — มีผลทันทีหลังบันทึก
        </p>
      </header>

      <AdminSiteSettingsForm settings={settings} />
    </div>
  );
}
