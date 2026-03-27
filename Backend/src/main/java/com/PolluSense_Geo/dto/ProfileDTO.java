package com.PolluSense_Geo.dto;

public class ProfileDTO {
    private Long id;
    private String name;
    private String email;
    private String provider;
    private String mobileNumber;
    private String address;

    public ProfileDTO() {
    }

    public ProfileDTO(Long id, String name, String email, String provider,
            String mobileNumber, String address) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.provider = provider;
        this.mobileNumber = mobileNumber;
        this.address = address;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public String getMobileNumber() {
        return mobileNumber;
    }

    public void setMobileNumber(String mobileNumber) {
        this.mobileNumber = mobileNumber;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }
}
