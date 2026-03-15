package org.composerguesser.backend.dto;

public class ComposerSummaryDto {

    private Long composerId;
    private String name;

    public ComposerSummaryDto(Long composerId, String firstName, String lastName) {
        this.composerId = composerId;
        this.name = firstName + " " + lastName;
    }

    public Long getComposerId() { return composerId; }
    public String getName() { return name; }
}
