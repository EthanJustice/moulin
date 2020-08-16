// controls
import { dispatch, main, preview, dashboard } from "../core.js";

const showMain = () => {
    if (!main.classList.contains("hidden")) return;
    dispatch(`slides-opened`, {}, window);
    main.classList.remove("hidden");
    dashboard.classList.add("hidden");
};

const showDashboard = () => {
    if (!dashboard.classList.contains("hidden")) return;
    dispatch(`dashboard-opened`, {}, window);
    main.classList.add("hidden");
    dashboard.classList.remove("hidden");
};

export { showMain, showDashboard };
