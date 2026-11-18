package com.cinebook.booking;

import com.cinebook.seat.Seat;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private Long showtimeId;

    @ManyToMany(cascade = {CascadeType.PERSIST})
    @JoinTable(
            name = "booking_seat",
            joinColumns = @JoinColumn(name = "booking_id"),
            inverseJoinColumns = @JoinColumn(name = "seat_id"))
    private List<Seat> seats = new ArrayList<>();

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal total;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingStatus status;

    private String paymentReference;

    @Column(nullable = false, unique = true)
    private String idempotencyKey;

    public static Booking pending(Long userId, Long showtimeId, List<Seat> seats, BigDecimal total) {
        Booking booking = new Booking();
        booking.userId = userId;
        booking.showtimeId = showtimeId;
        booking.seats = new ArrayList<>(seats);
        booking.total = total;
        booking.status = BookingStatus.PENDING;
        booking.idempotencyKey = UUID.randomUUID().toString();
        return booking;
    }

    public void confirm(String paymentReference) {
        this.paymentReference = paymentReference;
        this.status = BookingStatus.CONFIRMED;
    }

    public void setTotal(BigDecimal total) {
        this.total = total;
    }
}
