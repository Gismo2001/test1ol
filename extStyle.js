//extStyle.js
import { Style, Icon } from 'ol/style.js';
const sleStyle = new Style
({
    image: new Icon
    (
        {
        src: './data/sle.svg',
        scale: .9 
        }
    )
});
export { sleStyle };