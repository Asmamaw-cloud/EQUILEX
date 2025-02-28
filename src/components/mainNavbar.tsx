import { Link } from "lucide-react"




const Navbar = () => {
  return (
    <div>
        <div className="w-[15%] lg:pl-12">
            <Link href="/">
                <h1 className="w-full text-3xl font-bold text-black">
                    <span className="text-[#7B3B99]">EQUI</span>LEX
                </h1>
            </Link>
        </div>

    </div>
  )
}

export default Navbar