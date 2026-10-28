import CompleteProfileForm from "../features/authentication/CompleteProfileForm";

function CompleteProfile() {
  return (
    <div className="h-screen bg-secondary-0">
      <div className="container xl:max-w-(--breakpoint-xl)">
        <CompleteProfileForm />
      </div>
    </div>
  );
}

export default CompleteProfile;
