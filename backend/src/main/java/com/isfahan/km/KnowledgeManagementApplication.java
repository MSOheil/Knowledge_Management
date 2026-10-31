package com.isfahan.km;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = {"com.isfahan.km", "com.example.base"})
public class KnowledgeManagementApplication {

    public static void main(String[] args) {
        SpringApplication.run(KnowledgeManagementApplication.class, args);
    }
}
