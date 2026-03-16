package org.composerguesser.backend.model;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "tbl_user_point")
public class UserPoint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long pointId;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private LocalDate excerptDayDate;

    @Column(nullable = false)
    private int points;

    @Column(nullable = false)
    private LocalDateTime earnedAt;

    public UserPoint() {}

    public UserPoint(Long userId, LocalDate excerptDayDate, int points, LocalDateTime earnedAt) {
        this.userId = userId;
        this.excerptDayDate = excerptDayDate;
        this.points = points;
        this.earnedAt = earnedAt;
    }

    public Long getPointId() { return pointId; }
    public Long getUserId() { return userId; }
    public LocalDate getExcerptDayDate() { return excerptDayDate; }
    public int getPoints() { return points; }
    public LocalDateTime getEarnedAt() { return earnedAt; }
}
