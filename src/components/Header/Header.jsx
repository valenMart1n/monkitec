import { Icon } from '../Icons';
import './Header.css';

function Header(){
    return(
        <header className="header-background">
           <FontAwesomeIcon icon={byPrefixAndName.fas['bars']} />
        </header>
    )
}
export default Header;
