export const ArrowDropRight = ({
    className,
    fill,
}: {
    className?: string;
    fill?: string;
}) => {
    return (
        <svg
            className={className}
            width="24"
            height="24"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            style={{
                aspectRatio: "24 / 24",
            }}
        >

            <path d="M12.1717 12.0005L9.34326 9.17203L10.7575 7.75781L15.0001 12.0005L10.7575 16.2431L9.34326 14.8289L12.1717 12.0005Z"
                fill={fill}></path>


        </svg>
    );
};



