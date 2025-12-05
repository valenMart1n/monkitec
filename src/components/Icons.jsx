import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import '@fortawesome/fontawesome-free/css/all.min.css';

export const Icon = ({icon,css}) => {
    return(
        <FontAwesomeIcon className={css} icon={icon}/>
    )
}
