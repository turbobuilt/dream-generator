import { createVuetify } from 'vuetify'
import 'vuetify/styles'
import backgroundImages from "./directives/background-images";
import Btn from "./ui-elements/Btn.vue";
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'
import { touchable } from './directives/touchable';
import { scrollable } from './directives/scrollable';
import { zoomable } from './directives/zoomable';

export function addConfig(app) {
    const vuetify = createVuetify({
        icons: {
            defaultSet: 'mdi',
            aliases,
            sets: {
                mdi,
            },
        },
        theme: {
            themes: {
                light: {
                    colors: {
                        primary: "#2196f3"
                    }
                },
            },
        },
    });
    app.directive("touchable", touchable)
    app.directive("scrollable", scrollable)
    app.directive("zoomable", zoomable)
    app.use(vuetify);
    app.component("btn", Btn);
    app.directive("background-images", backgroundImages);
}