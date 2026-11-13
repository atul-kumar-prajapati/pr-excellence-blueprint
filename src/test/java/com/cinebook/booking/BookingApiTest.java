package com.cinebook.booking;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.cinebook.catalog.Movie;
import com.cinebook.catalog.MovieRepository;
import com.cinebook.catalog.Showtime;
import com.cinebook.catalog.ShowtimeRepository;
import com.cinebook.seat.Seat;
import com.cinebook.seat.SeatRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class BookingApiTest {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    MovieRepository movieRepository;

    @Autowired
    ShowtimeRepository showtimeRepository;

    @Autowired
    SeatRepository seatRepository;

    private Long seatId;

    @BeforeEach
    void seed() {
        Movie movie = movieRepository.save(new Movie("Dune: Part Two", 166));
        Showtime showtime = showtimeRepository.save(
                new Showtime(movie, LocalDateTime.of(2026, 11, 14, 19, 30), "Screen 1"));
        Seat seat = seatRepository.save(new Seat(showtime, "A1", new BigDecimal("249.50")));
        seatId = seat.getId();
    }

    @Test
    void givenFreeSeat_whenReserve_thenCreatedAndOwnerCanReadIt() throws Exception {
        String body = """
                {"showtimeId": %d, "seatIds": [%d]}
                """.formatted(seatRepository.findById(seatId).orElseThrow().getShowtime().getId(), seatId);

        String locationJson = mockMvc.perform(post("/api/bookings")
                        .header("X-User-Id", "1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("CONFIRMED"))
                .andExpect(jsonPath("$.seatNumbers[0]").value("A1"))
                .andReturn()
                .getResponse()
                .getContentAsString();

        long bookingId = Long.parseLong(locationJson.replaceAll(".*\"id\":(\\d+).*", "$1"));

        mockMvc.perform(get("/api/bookings/" + bookingId).header("X-User-Id", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(bookingId));

        mockMvc.perform(get("/api/bookings/" + bookingId).header("X-User-Id", "2"))
                .andExpect(status().isNotFound());
    }
}
