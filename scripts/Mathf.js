export default class Mathf {
    static mix(a, b, t) {
        return a + t * (b - a);
    }
}