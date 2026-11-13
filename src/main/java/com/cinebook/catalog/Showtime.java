package com.cinebook.catalog;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor
public class Showtime {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    private Movie movie;

    private LocalDateTime startsAt;
    private String auditorium;

    public Showtime(Movie movie, LocalDateTime startsAt, String auditorium) {
        this.movie = movie;
        this.startsAt = startsAt;
        this.auditorium = auditorium;
    }
}
