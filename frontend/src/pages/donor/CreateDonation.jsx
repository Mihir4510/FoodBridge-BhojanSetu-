// src/pages/donor/CreateDonation.jsx

import { useNavigate } from "react-router-dom";
import DonorLayout from "../../components/donor/DonorLayout";
import DonationForm from "../../components/donor/DonationForm";
import useToast from "../../hooks/useToast";
import ToastContainer from "../../components/donor/ToastContainer";

const CreateDonation = () => {
  const navigate          = useNavigate();
  const { toasts, toast } = useToast();

  const handleSuccess = () => {
    setTimeout(() => navigate("/donor/my-donations"), 1800);
  };

  return (
    <DonorLayout title="Create Donation" subtitle="List your surplus food for nearby NGOs.">
      <ToastContainer toasts={toasts} />

      <div className="max-w-2xl">
        {/* Info banner */}
        <div className="bg-[#D8F3DC] border border-[#B7E4C7] rounded-2xl px-5 py-4 flex items-start gap-3 mb-6">
          <span className="text-xl mt-0.5">🌿</span>
          <div>
            <p className="text-[13px] font-semibold text-[#1A4731]">Ready to rescue food?</p>
            <p className="text-[12px] text-[#2D6A4F] mt-0.5 leading-relaxed">
              Fill in the details below. Nearby NGOs will be notified instantly via real-time alerts.
              Donation priority is auto-calculated from the expiry time you set.
            </p>
          </div>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm">
          <DonationForm toast={toast} onSuccess={handleSuccess} />
        </div>
      </div>
    </DonorLayout>
  );
};

export default CreateDonation;
