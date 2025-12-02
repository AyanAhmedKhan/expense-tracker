import { HeroSection } from "@/components/ui/hero-section"
import { Icons } from "@/components/ui/icons"

export default function HeroDemo() {
    return (
        <div className="min-h-screen bg-gray-950">
            <HeroSection
                badge={{
                    text: "Introducing our new components",
                    action: {
                        text: "Learn more",
                        href: "/docs",
                    },
                }}
                title="Build faster with beautiful components"
                description="Premium UI components built with React and Tailwind CSS. Save time and ship your next project faster with our ready-to-use components."
                actions={[
                    {
                        text: "Get Started",
                        href: "/signup",
                        variant: "default",
                    },
                    {
                        text: "GitHub",
                        href: "https://github.com/AyanAhmedKhan",
                        variant: "glow",
                        icon: <Icons.gitHub className="h-5 w-5" />,
                    },
                ]}
                image={{
                    light: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
                    dark: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
                    alt: "UI Components Preview",
                }}
            />
        </div>
    )
}
