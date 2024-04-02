type Props = {
  logoUrl?: string;
  logoDarkUrl?: string;
};

export default function AppLogo(props: Props) {
  return (
    <div className="flex h-[64px] shrink-0 items-center px-6">
      {props.logoUrl && props.logoDarkUrl ? (
        <>
          <img
            className="h-8 w-auto dark:hidden"
            src={props.logoUrl}
            alt="Logo"
          />
          <img
            className="h-8 w-auto hidden dark:inline"
            src={props.logoDarkUrl}
            alt="Logo"
          />
        </>
      ) : props.logoUrl || props.logoDarkUrl ? (
        <img
          className="h-8 w-auto"
          src={props.logoDarkUrl || props.logoUrl}
          alt="Logo"
        />
      ) : (
        <span className="text-2xl font-bold text-foreground dark:text-white">
          SISMO
        </span>
      )}
    </div>
  );
}
