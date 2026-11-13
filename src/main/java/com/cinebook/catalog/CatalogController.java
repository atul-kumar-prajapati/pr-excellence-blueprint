package com.cinebook.catalog;

import com.cinebook.seat.Seat;
import com.cinebook.seat.SeatRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CatalogController {

    private final MovieRepository movieRepository;
    private final ShowtimeRepository showtimeRepository;
    private final SeatRepository seatRepository;

    @GetMapping("/movies")
    public List<MovieView> movies() {
        return movieRepository.findAll().stream()
                .map(movie -> new MovieView(movie.getId(), movie.getTitle(), movie.getRuntimeMinutes()))
                .toList();
    }

    @GetMapping("/movies/{movieId}/showtimes")
    public List<ShowtimeView> showtimes(@PathVariable Long movieId) {
        return showtimeRepository.findByMovieIdOrderByStartsAt(movieId).stream()
                .map(showtime -> new ShowtimeView(
                        showtime.getId(), movieId, showtime.getStartsAt(), showtime.getAuditorium()))
                .toList();
    }

    @GetMapping("/showtimes/{showtimeId}/seats")
    public List<SeatView> seats(@PathVariable Long showtimeId) {
        return seatRepository.findByShowtimeIdOrderByLabel(showtimeId).stream()
                .map(seat -> new SeatView(seat.getId(), seat.getLabel(), seat.getPrice(), seat.isTaken()))
                .toList();
    }

    public record MovieView(Long id, String title, int runtimeMinutes) {
    }

    public record ShowtimeView(Long id, Long movieId, LocalDateTime startsAt, String auditorium) {
    }

    public record SeatView(Long id, String label, BigDecimal price, boolean taken) {
    }
}
