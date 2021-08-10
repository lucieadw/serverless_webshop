FROM adoptopenjdk/openjdk11

COPY "./build/libs/spring.jar" app.jar

COPY run-app.sh .
RUN chmod +x run-app.sh

CMD [ "sh", "-c", "./run-app.sh" ]
