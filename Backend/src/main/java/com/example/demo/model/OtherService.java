package com.example.demo.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "other_services")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OtherService {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    @Column(length = 500)
    private String menuDetails;
    private String imageUrl;
    private String startPrice;
    private Boolean active;
}
