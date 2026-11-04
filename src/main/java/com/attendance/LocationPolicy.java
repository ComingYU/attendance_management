package com.attendance;

import java.time.Instant;
import java.util.Map;

/** Browser coordinates use WGS84. Never trust a client-supplied distance. */
public final class LocationPolicy {
    private LocationPolicy() {}
    public record Position(Double latitude, Double longitude, Double accuracy, Long timestamp) {}
    public record Visit(String site, Double distanceMeters) {}

    static double number(Object value, String label) {
        if (!(value instanceof Number n) || !Double.isFinite(n.doubleValue()))
            throw new IllegalArgumentException("请填写有效的" + label);
        return n.doubleValue();
    }
    static void coordinates(double latitude, double longitude) {
        if (!Double.isFinite(latitude) || !Double.isFinite(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180)
            throw new IllegalArgumentException("纬度须在 -90 至 90，经度须在 -180 至 180 之间");
    }
    static double distanceMeters(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1), dLon = Math.toRadians(lon2 - lon1);
        double a = Math.pow(Math.sin(dLat / 2), 2) + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) * Math.pow(Math.sin(dLon / 2), 2);
        return 6371008.8 * 2 * Math.asin(Math.sqrt(Math.max(0, Math.min(1, a))));
    }
    static Visit check(Map<String, Object> settings, Position position) {
        if (!Boolean.TRUE.equals(settings.get("location_enabled"))) return new Visit(null, null);
        if (position == null) throw new IllegalArgumentException("此打卡地点要求定位，请允许浏览器获取当前位置");
        double lat = number(position.latitude(), "定位纬度"), lon = number(position.longitude(), "定位经度");
        coordinates(lat, lon);
        double accuracy = number(position.accuracy(), "定位精度");
        double radius = number(settings.get("site_radius"), "打卡半径");
        if (accuracy <= 0 || accuracy > radius) throw new IllegalArgumentException("定位精度不足，请到开阔处重新定位（误差需小于等于 " + Math.round(radius) + " 米）");
        long now = Instant.now().toEpochMilli();
        if (position.timestamp() == null || position.timestamp() < now - 120000 || position.timestamp() > now + 30000)
            throw new IllegalArgumentException("定位已过期或时间无效，请重新定位");
        double distance = distanceMeters(number(settings.get("site_latitude"), "地点纬度"), number(settings.get("site_longitude"), "地点经度"), lat, lon);
        if (distance > radius) throw new IllegalArgumentException("不在允许打卡范围内：距离地点约 " + Math.round(distance) + " 米，允许半径 " + Math.round(radius) + " 米");
        return new Visit(settings.get("site_name").toString(), Math.round(distance * 10) / 10.0);
    }
}
