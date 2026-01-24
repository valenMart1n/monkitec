import { faInstagram } from "@fortawesome/free-brands-svg-icons";
import { Icon } from "../Icon";
import "./Footer.css";


function Footer(){
    return(
        <div className="footer-background">
            <p className="footer-title">Monkitec ©2026</p>
            <Icon css="footer-media-icons" icon={faInstagram} onClick={() => window.open("https://www.instagram.com/monkitec.pna/", "_blank")}/>
        </div>
    )
}

export default Footer;