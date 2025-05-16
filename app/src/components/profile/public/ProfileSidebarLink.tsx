export default function ProfileSidebarLink({ href, icon, text }: { href: string, icon: React.ReactNode, text: React.ReactNode }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-row gap-2 items-center hover:bg-secondary pl-[10px] py-[5px] rounded-md mx-[-10px]"
        >
            {icon}
            <div className="text-sm text-secondary-foreground">{text}</div>
        </a>
    )
}