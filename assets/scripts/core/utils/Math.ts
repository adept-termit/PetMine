import {math} from "cc";

export function deltaAngle(current: number, target: number) {
    let num = math.repeat((target - current), 360);

    if (num > 180) {
        num -= 360;
    }

    return num;
}

export function smoothDamp(current: number, target: number, currentVelocity: { value: number }, smoothTime: number, maxSpeed: number, deltaTime: number): number {
    smoothTime = Math.max(0.0001, smoothTime);

    const omega = 2 / smoothTime;
    const x = omega * deltaTime;
    const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);

    let change = current - target;
    const originalTo = target;

    const maxChange = maxSpeed * smoothTime;

    change = math.clamp(change, -maxChange, maxChange);
    target = current - change;

    const temp = (currentVelocity.value + omega * change) * deltaTime;

    currentVelocity.value = (currentVelocity.value - omega * temp) * exp;

    let output = target + (change + temp) * exp;

    if ((originalTo - current > 0) == output > originalTo) {
        output = originalTo;
        currentVelocity.value = (output - originalTo) / deltaTime;
    }

    return output;
}

export function smoothDampAngle(current: number, target: number, currentVelocity: { value: number }, smoothTime: number, deltaTime: number): number {
    target = current + deltaAngle(current, target);

    return smoothDamp(current, target, currentVelocity, smoothTime, Infinity, deltaTime);
}