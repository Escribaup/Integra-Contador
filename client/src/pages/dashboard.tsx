import { useState } from "react";
import AppHeader from "@/components/app-header";
import WelcomeSection from "@/components/welcome-section";
import ConfigurationProgress from "@/components/configuration-progress";
import NavigationSidebar from "@/components/navigation-sidebar";
import CredentialsModule from "@/components/credentials-module";
import CertificateModule from "@/components/certificate-module";
import AuthenticationModule from "@/components/authentication-module";
import ServicesModule from "@/components/services-module";
import HelpSection from "@/components/help-section";

type ModuleType = "credentials" | "certificate" | "authentication" | "services";

export default function Dashboard() {
  const [activeModule, setActiveModule] = useState<ModuleType>("credentials");

  const renderActiveModule = () => {
    switch (activeModule) {
      case "credentials":
        return <CredentialsModule />;
      case "certificate":
        return <CertificateModule />;
      case "authentication":
        return <AuthenticationModule />;
      case "services":
        return <ServicesModule />;
      default:
        return <CredentialsModule />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <WelcomeSection />
        <ConfigurationProgress currentStep={1} />
        
        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-3">
            <NavigationSidebar 
              activeModule={activeModule} 
              onModuleChange={setActiveModule} 
            />
          </div>
          
          <div className="lg:col-span-9">
            {renderActiveModule()}
          </div>
        </div>
        
        <HelpSection />
      </div>
    </div>
  );
}
