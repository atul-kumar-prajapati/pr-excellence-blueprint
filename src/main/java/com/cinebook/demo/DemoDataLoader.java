package com.cinebook.demo;

import com.cinebook.catalog.Movie;
import com.cinebook.catalog.MovieRepository;
import com.cinebook.catalog.Showtime;
import com.cinebook.catalog.ShowtimeRepository;
import com.cinebook.seat.Seat;
import com.cinebook.seat.SeatRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Component
@Profile("!test")
@RequiredArgsConstructor
public class DemoDataLoader implements CommandLineRunner {

    private final MovieRepository movieRepository;
    private final ShowtimeRepository showtimeRepository;
    private final SeatRepository seatRepository;

    @Override
    public void run(String... args) {
        if (movieRepository.count() > 0) {
            return;
        }

        Movie dune = movieRepository.save(new Movie("Dune: Part Two", 166));
        Movie oppenheimer = movieRepository.save(new Movie("Oppenheimer", 180));

        Showtime evening = showtimeRepository.save(
                new Showtime(dune, LocalDateTime.of(2026, 11, 14, 19, 30), "Screen 1"));
        Showtime matinee = showtimeRepository.save(
                new Showtime(oppenheimer, LocalDateTime.of(2026, 11, 14, 14, 0), "Screen 2"));

        seatRepository.saveAll(row(evening, "A", new BigDecimal("249.50")));
        seatRepository.saveAll(row(matinee, "B", new BigDecimal("199.00")));
    }

    private static List<Seat> row(Showtime showtime, String rowLabel, BigDecimal price) {
        List<Seat> seats = new ArrayList<>();
        for (int number = 1; number <= 8; number++) {
            seats.add(new Seat(showtime, rowLabel + number, price));
        }
        return seats;
    }
}
