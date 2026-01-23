import React from "react";
import { useSelector } from "react-redux";
import DrawerBase from "./DrawerBase";

import GoldDrawerUI from "./gold/GoldDrawerUI";
import LOSDrawerUI from "./los/LOSDrawerUI";
import VehicleDrawerUI from "./vehicle/VehicleDrawerUI";
import CollectionDrawerUI from "./collection/CollectionDrawerUI";
import PaymentDrawer from "./payment/PaymentDrawer";

export default function DrawerRoot() {
    const module = useSelector(state => state.module.selectedModule);
    // const module = 'collection'
    const renderDrawer = () => {
        switch (module) {
            case "gold":
                return <GoldDrawerUI />;
            case "los":
                return <LOSDrawerUI />;
            case "vehicle":
                return <VehicleDrawerUI />;
            case "collection":
                return <CollectionDrawerUI />;
            case "payment":
                return < PaymentDrawer />;
            default:
                return null;
        }
    };

    return <DrawerBase>{renderDrawer()}</DrawerBase>;
}
