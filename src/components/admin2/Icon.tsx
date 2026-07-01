type IconProps = {
  name: string;
  className?: string;
};

function Icon({ name, className = "" }: IconProps) {
  return (
    <span className={`material-symbols-outlined align-middle ${className}`.trim()} aria-hidden="true">
      {name}
    </span>
  );
}

export default Icon;
