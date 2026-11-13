package com.cinebook.seat;

import com.cinebook.catalog.Showtime;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Version;
import java.math.BigDecimal;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor
public class Seat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    private Showtime showtime;

    @Column(nullable = false)
    private String label;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    private boolean taken;

    @Version
    private Long version;

    public Seat(Showtime showtime, String label, BigDecimal price) {
        this.showtime = showtime;
        this.label = label;
        this.price = price;
        this.taken = false;
    }

    public void markTaken() {
        this.taken = true;
    }
}
