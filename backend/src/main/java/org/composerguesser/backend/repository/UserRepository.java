package org.composerguesser.backend.repository;

import org.composerguesser.backend.dto.LeaderboardProjection;
import org.composerguesser.backend.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);

    /**
     * Returns all users ranked by total points descending, with their current streak.
     */
    @Query(value = "SELECT username, total_points AS points, current_streak AS streak FROM tbl_user ORDER BY total_points DESC",
           countQuery = "SELECT COUNT(*) FROM tbl_user",
           nativeQuery = true)
    Page<LeaderboardProjection> findAllTimeLeaderboard(Pageable pageable);

    /**
     * Returns 1-based all-time rank for the given user (number of users with strictly more points + 1).
     */
    @Query(value = "SELECT COUNT(*) + 1 FROM tbl_user WHERE total_points > (SELECT total_points FROM tbl_user WHERE user_id = :userId)",
           nativeQuery = true)
    int findAllTimeRankByUserId(@Param("userId") Long userId);
}
