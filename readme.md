in /etc/nginx/conf.d/default.conf:

location /gadgets {
    proxy_set_header Host $http_host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_pass http://csmanager;
}



in http {} block of /etc/nginx/nginx.conf:

upstream csmanager {
    ip_hash;
    #cs-manager
    server 198.19.253.32;
    #cs-manager-2
    server 198.19.253.49;
}
