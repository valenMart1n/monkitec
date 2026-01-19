import "./LoadingSpinner.css";
import icon from "../../img/icono.jpg";

function LoadingSpinner(){
    return(
        <div className="loading-spinner-background">
            <img
                className="spinner-icon"
                src={icon}
            />
        </div>
    );
}

export default LoadingSpinner;