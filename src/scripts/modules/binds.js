// controls
import { dispatch, main, index, dashboard } from "../core.js";

const showMain = () => {
    if (!main.classList.contains("hidden")) return;
    dispatch(`slides-opened`, {}, window);
    main.classList.remove("hidden");
    index.classList.add("hidden");
    dashboard.classList.add("hidden");
};

const showDashboard = () => {
    if (!dashboard.classList.contains("hidden")) return;
    dispatch(`dashboard-opened`, {}, window);
    main.classList.add("hidden");
    index.classList.add("hidden");
    dashboard.classList.remove("hidden");
};

const showIndex = () => {
    if (!index.classList.contains("hidden")) return;
    dispatch(`index-opened`, {}, window);
    main.classList.add("hidden");
    dashboard.classList.add("hidden");
    index.classList.remove("hidden");
};

export { showMain, showDashboard, showIndex };
