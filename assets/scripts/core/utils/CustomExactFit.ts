import { math, Rect, ResolutionPolicy, screen, view, View } from 'cc';
import { EDITOR } from 'cc/env';

class CustomExactFit extends ResolutionPolicy.ContentStrategy {
    name = 'CustomExactFit';

    apply(_view: View, designedResolution: math.Size) {
        const windowSize = screen.windowSize;
        const containerW = windowSize.width;
        const containerH = windowSize.height;
        const scaleX = containerW / designedResolution.width;
        const scaleY = containerH / designedResolution.height;
        const scale = Math.min(scaleX, scaleY);

        return {
            scale: [scale, scale],
            viewport: new Rect(0, 0, containerW, containerH)
        }
    }
}

if (!EDITOR) {
    const fitStrategy = new CustomExactFit();
    const resolutionPolicy = new ResolutionPolicy(ResolutionPolicy.ContainerStrategy.EQUAL_TO_FRAME, fitStrategy);

    view.setResolutionPolicy(resolutionPolicy);
}

