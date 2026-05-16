import Header from "../components/Header"
import QueryForm from "../components/QueryForm"
export default function Home_page()
{
    return(
        <>
         <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-4xl">
            <Header />
            <QueryForm />
        </div>
        </div>

        </>
    )
}