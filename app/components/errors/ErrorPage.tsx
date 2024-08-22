import { useNavigate } from "@remix-run/react";
import { Link } from "@shopify/polaris";

export default function ErrorPage() {
    const navigate = useNavigate();

    return (
        <div>
            <main
            style={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
            }}
            >

            <p>Something went wrong on our end. Try again in a few minutes. If you need help, contact Support.</p>
            <br></br>
            <p><Link onClick={() => {
                navigate('/');
            }}>Return home.</Link></p>
            </main>
        </div>
    );
}
