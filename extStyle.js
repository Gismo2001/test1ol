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

const wehStyle = new Style({
    image: new Icon({
        src: './data/weh.svg',
        scale: .9 
    })
});
export { wehStyle };

export function test (c, d) {
    return c * d;
} 