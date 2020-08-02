// controls
import { dispatch, main, preview, dashboard } from "../core.js";

const showMain = () => {
    if (!main.classList.contains("hidden")) return;
    dispatch(`slides-opened`, {}, window);
    main.classList.remove("hidden");
    dashboard.classList.add("hidden");
    preview.classList.add("hidden");
};

const showDashboard = () => {
    if (!dashboard.classList.contains("hidden")) return;
    dispatch(`dashboard-opened`, {}, window);
    main.classList.add("hidden");
    dashboard.classList.remove("hidden");
    preview.classList.add("hidden");
};

const showPreview = () => {
    if (!preview.classList.contains("hidden")) return;
    dispatch(`preview-opened`, {}, window);
    main.classList.add("hidden");
    dashboard.classList.add("hidden");
    preview.classList.remove("hidden");
};

export { showMain, showDashboard, showPreview };
