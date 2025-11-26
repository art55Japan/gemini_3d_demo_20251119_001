/**
 * NotificationManager Class
 * Responsible for displaying notification messages to the user
 */
export class NotificationManager {
    constructor() {
        this.notification = null;
        this.notificationTimeout = null;
        this.createUI();
    }

    createUI() {
        this.notification = document.createElement('div');
        this.notification.style.position = 'absolute';
        this.notification.style.top = '20px';
        this.notification.style.right = '20px';
        this.notification.style.padding = '10px 20px';
        this.notification.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        this.notification.style.color = 'white';
        this.notification.style.borderRadius = '5px';
        this.notification.style.fontFamily = 'sans-serif';
        this.notification.style.display = 'none';
        this.notification.style.transition = 'opacity 0.5s';
        document.body.appendChild(this.notification);
    }

    show(message, duration = 2000) {
        this.notification.innerText = message;
        this.notification.style.display = 'block';
        this.notification.style.opacity = '1';

        if (this.notificationTimeout) {
            clearTimeout(this.notificationTimeout);
        }

        this.notificationTimeout = setTimeout(() => {
            this.hide();
        }, duration);
    }

    hide() {
        this.notification.style.opacity = '0';
        setTimeout(() => {
            this.notification.style.display = 'none';
        }, 500);
    }
}
